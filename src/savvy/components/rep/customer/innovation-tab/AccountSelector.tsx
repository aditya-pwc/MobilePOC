import React, { useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, View, TouchableOpacity, Image, ScrollView } from 'react-native'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import _ from 'lodash'
import { SearchBar } from 'react-native-elements'
import StorePlaceholderSvg from '../../../../../../assets/image/Icon-store-placeholder.svg'
import BackButton from '../../../common/BackButton'
import EmptyListPlaceholder from '../../../common/EmptyListPlaceholder'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import { useMetricsCustomer } from '../../../../hooks/InnovationProductHooks'
import { t } from '../../../../../common/i18n/t'
import { useDebounce } from '../../../../hooks/CommonHooks'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    eHeader: {
        flex: 1,
        backgroundColor: baseStyle.color.white
    },
    searchInputContainer: {
        fontSize: 14,
        color: '#565656'
    },
    searchBarInnerContainer: {
        width: '85%',
        height: 36,
        borderRadius: 10,
        backgroundColor: '#F0F3F6'
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    searchBarInputContainer: {
        backgroundColor: '#F0F3F6'
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    },
    accountContainer: {
        backgroundColor: '#FFFFFF',
        marginTop: 16,
        borderRadius: 5,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        flexDirection: 'column'
    },
    whiteBoxContainer: {
        height: 120,
        flexDirection: 'row'
    },
    iconInfoContainer: {
        width: '24%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    accountIconContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    whiteBoxInfoContainer: {
        width: '58%',
        flexDirection: 'column'
    },
    addressInnerContainer: {
        width: '100%',
        paddingLeft: '1%',
        paddingTop: 22
    },
    companyText: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 8,
        marginBottom: 3
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    NoResultTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10
    },
    NoResultContent: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center'
    },
    addImage: {
        height: 24,
        width: 24
    },
    addText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#00A2D9'
    },
    marginRight5: {
        marginRight: '5%'
    },
    otsLogo: {
        height: 58,
        width: 58,
        marginRight: '5%'
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    addBtnContainer: {
        width: '16%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyTitle: {
        alignItems: 'center',
        marginBottom: 10
    },
    emptyTitle1: {
        alignItems: 'center',
        width: '120%'
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        backgroundColor: '#F2F4F7',
        paddingTop: 10,
        marginBottom: '13%'
    },
    backContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        marginHorizontal: '5%',
        paddingVertical: 10
    },
    backColor: {
        tintColor: '#0098D4'
    },
    filterView: {
        flex: 1,
        alignItems: 'center',
        marginRight: '8%'
    },
    searchBarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20
    }
})

interface KeyAccountSelectorProps {
    cRef: any
    onBack: any
    selectedCustomers: any
    setSelectedCustomers: any
    isAccountShowSelector: boolean
}

const AccountSelector = (props: KeyAccountSelectorProps) => {
    const { onBack, selectedCustomers, setSelectedCustomers, isAccountShowSelector } = props
    const [selectedCustomer, setSelectedCustomer] = useState(selectedCustomers)
    const [searchChange, setSearchChange] = useState('')
    const [searchText, setSearchText] = useState('')
    const customerList = useMetricsCustomer(searchText, isAccountShowSelector)

    const saveSelectedCustomer = () => {
        setSelectedCustomers(selectedCustomer)
        setTimeout(() => {
            onBack()
        }, 500)
    }
    const checkSelected = (item: any) => {
        return selectedCustomer.find((obj) => item.Id === obj.Id)
    }

    useDebounce(() => setSearchText(searchChange), 300, [searchChange])

    const renderAddButton = (item: any) => {
        if (checkSelected(item)) {
            return (
                <TouchableOpacity
                    style={styles.accountIconContainer}
                    onPress={() => {
                        const addedCustomerList = _.cloneDeep(selectedCustomer)
                        setSelectedCustomer(addedCustomerList.filter((obj) => obj.Id !== item.Id))
                    }}
                >
                    <Image
                        style={styles.addImage}
                        source={require('../../../../../../assets/image/icon_checkmark_circle.png')}
                    />
                </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity
                style={styles.accountIconContainer}
                onPress={() => {
                    const selectedCustomerList = _.cloneDeep(selectedCustomer)
                    selectedCustomerList.push(item)
                    setSelectedCustomer(selectedCustomerList)
                }}
            >
                <CText style={styles.addText}>{t.labels.PBNA_MOBILE_ADD}</CText>
            </TouchableOpacity>
        )
    }
    const renderCustomerItem = (item) => {
        return (
            <TouchableOpacity style={[styles.accountContainer]} key={item.Id}>
                <View style={styles.whiteBoxContainer}>
                    <View style={styles.iconInfoContainer}>
                        <View style={[styles.accountIconContainer]}>
                            {item.IsOTSCustomer__c === '0' && <StorePlaceholderSvg style={styles.marginRight5} />}
                            {item.IsOTSCustomer__c === '1' && (
                                <Image
                                    style={styles.otsLogo}
                                    source={require('../../../../../../assets/image/OTS-Logo-Not-Signed.png')}
                                />
                            )}
                        </View>
                    </View>
                    <View style={styles.whiteBoxInfoContainer}>
                        <View style={commonStyle.flexDirectionRow}>
                            <View style={styles.addressInnerContainer}>
                                <CText numberOfLines={2} style={styles.itemName} fontFamily={'Gotham-Black'}>
                                    {item.Name}
                                </CText>
                                <CText style={styles.streetText} numberOfLines={1}>
                                    {item.ShippingStreet}
                                </CText>
                                <CText style={styles.cityText} numberOfLines={1}>
                                    {item.ShippingCity ? item.ShippingCity + ', ' : null}
                                    {item.ShippingState}
                                    {item.ShippingPostalCode ? ' ' + item.ShippingPostalCode : null}
                                </CText>
                            </View>
                        </View>
                    </View>
                    <View style={styles.addBtnContainer}>{renderAddButton(item)}</View>
                </View>
            </TouchableOpacity>
        )
    }
    const renderList = () => {
        if (_.isEmpty(customerList)) {
            return (
                <EmptyListPlaceholder
                    title={
                        <View style={styles.emptyTitle1}>
                            <CText style={styles.NoResultTitle}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_1}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_2}</CText>
                            <CText style={styles.NoResultContent}>{t.labels.PBNA_MOBILE_METRICS_NO_RESULTS_3}</CText>
                        </View>
                    }
                    transparentBackground
                />
            )
        }
        return (
            <ScrollView style={styles.listContainer}>
                {customerList.map((item) => {
                    return renderCustomerItem(item)
                })}
            </ScrollView>
        )
    }

    return (
        <Modal visible animationType="fade" transparent>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={styles.backContainer}>
                        <BackButton
                            extraStyle={styles.backColor}
                            onBackPress={() => {
                                onBack()
                            }}
                        />
                        <View style={styles.filterView}>
                            <CText style={[styles.navTitle]}>{t.labels.PBNA_MOBILE_SORT_FILTER}</CText>
                        </View>
                    </View>
                    <View style={styles.searchBarContainer}>
                        <SearchBar
                            platform={'ios'}
                            placeholder={t.labels.PBNA_MOBILE_METRICS_SEARCH_CUSTOMERS}
                            allowFontScaling={false}
                            cancelButtonTitle={''}
                            containerStyle={styles.searchBarInnerContainer}
                            inputContainerStyle={styles.searchBarInputContainer}
                            value={searchChange}
                            inputStyle={styles.searchInputContainer}
                            onChangeText={(v) => setSearchChange(v)}
                        />
                    </View>
                    {renderList()}
                    {selectedCustomer.length > 0 && (
                        <FormBottomButton
                            rightButtonLabel={`${t.labels.PBNA_MOBILE_ADD} ${selectedCustomer.length} ${t.labels.PBNA_MOBILE_METRICS_CUSTOMERS}`}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                            onPressCancel={() => {
                                onBack()
                            }}
                            onPressSave={() => {
                                saveSelectedCustomer()
                            }}
                        />
                    )}
                    {selectedCustomer.length === 0 && (
                        <FormBottomButton
                            rightButtonLabel={t.labels.PBNA_MOBILE_FILTER_ADD_CUSTOMERS}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                            onPressCancel={() => {
                                onBack()
                            }}
                            onPressSave={() => {
                                saveSelectedCustomer()
                            }}
                            disableSave
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export default AccountSelector
