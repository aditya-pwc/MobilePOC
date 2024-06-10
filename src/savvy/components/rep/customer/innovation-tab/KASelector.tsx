import React, { useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, View, FlatList } from 'react-native'
import _ from 'lodash'
import { baseStyle } from '../../../../../common/styles/BaseStyle'
import CText from '../../../../../common/components/CText'
import FormBottomButton from '../../../../../common/components/FormBottomButton'
import CCheckBox from '../../../../../common/components/CCheckBox'
import { SoupService } from '../../../../service/SoupService'
import { useGetFilterKeyAccount } from '../../../../hooks/InnovationProductHooks'
import { t } from '../../../../../common/i18n/t'
import { Instrumentation } from '@appdynamics/react-native-agent'
import { CommonParam } from '../../../../../common/CommonParam'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    eHeader: {
        width: '90%',
        height: 560,
        borderRadius: 8,
        paddingBottom: 0,
        overflow: 'hidden',
        backgroundColor: baseStyle.color.white
    },
    eTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_24,
        fontWeight: baseStyle.fontWeight.fw_900,
        lineHeight: 60
    },
    navTitle: {
        color: baseStyle.color.black,
        fontSize: baseStyle.fontSize.fs_12,
        fontWeight: baseStyle.fontWeight.fw_700
    },
    bottomButton: {
        shadowColor: baseStyle.color.modalBlack,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 10
    },
    flexDirectionRow: {
        flexDirection: 'row'
    },
    buttonSize: {
        borderRadius: 0,
        height: 60
    },
    fontFamily: {
        fontFamily: 'Gotham-Bold',
        textTransform: 'uppercase'
    },
    smallFontSize: {
        fontSize: 14
    },
    midFontSize: {
        fontSize: 16
    },
    borderRightShadow: {
        borderRightWidth: 1,
        borderRightColor: baseStyle.color.modalBlack
    },
    bgPurpleColor: {
        backgroundColor: '#6C0CC3'
    },
    fontPurpleColor: {
        color: '#6C0CC3'
    },
    tintColor: {
        tintColor: '#0098D4'
    },
    fontWhiteColor: {
        color: '#FFFFFF'
    },
    shadowButton: {
        shadowColor: '#87939E',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    checkedIcon: {
        width: 20,
        height: 20,
        marginRight: 10
    },
    containerStyle: {
        borderWidth: 0,
        marginLeft: 0,
        paddingLeft: 0,
        backgroundColor: 'transparent'
    },
    KACheckBoxContainer: {
        height: 18,
        justifyContent: 'center',
        marginBottom: 33
    },
    KATitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        paddingTop: 30,
        paddingBottom: 20,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    KASelectorListContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        flexWrap: 'wrap'
    },
    OTSCustCheckBox: {
        height: 60,
        justifyContent: 'center',
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    formButtonWrapper: {
        bottom: -30,
        position: 'relative',
        width: '100%',
        height: 60,
        borderRadius: 8
    }
})

interface KeyAccountSelectorProps {
    cRef: any
    onBack: Function
    selectedKAs: any
    setSelectedKAs: any
    setIsKAChange?: (isKAChange: boolean) => void
    isShowSelector: boolean
    setSelectedCustomer?: any
    selectedCustomer?: any
    page: string
    otsSelected: boolean
    setOtsSelected: (otsSelected: boolean) => void
}

const KeyAccountSelector = (props: KeyAccountSelectorProps) => {
    const {
        onBack,
        selectedKAs,
        setSelectedKAs,
        setIsKAChange,
        setSelectedCustomer,
        selectedCustomer,
        isShowSelector,
        page,
        otsSelected,
        setOtsSelected
    } = props
    const keyAccountLst = useGetFilterKeyAccount(isShowSelector, page)
    const [selectedKA, setSelectedKA] = useState(selectedKAs)
    const [ots, setOts] = useState(otsSelected)

    const saveSelectedKeyAccount = async () => {
        if (selectedCustomer && setSelectedCustomer) {
            const newKA = selectedKA
            const preKA = selectedKAs
            const insertKALst = newKA.reduce((pre, cur) => {
                if (preKA.every((item) => item.Id !== cur.Id)) {
                    pre.push(cur)
                }
                return pre
            }, [])
            const removeKALst = preKA.reduce((pre, cur) => {
                if (newKA.every((item) => item.Id !== cur.Id)) {
                    pre.push(cur)
                }
                return pre
            }, [])
            let customerLst
            if (removeKALst.length) {
                const removeCustomerLst = await SoupService.retrieveDataFromSoup('Account', {}, [], null, [
                    'WHERE {Account:Id} IN ' +
                        '(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ' +
                        `(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN (${removeKALst
                            .map((v) => "'" + v.Id + "'")
                            .join(',')})))` +
                        " AND {Account:CUST_LVL__c} = 'Customer Outlet'" +
                        ' ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
                ])
                customerLst = selectedCustomer.reduce((pre, cur) => {
                    if (removeCustomerLst.every((item) => item.Id !== cur.Id)) {
                        pre.push(cur)
                    }
                    return pre
                }, [])
            }
            if (insertKALst.length) {
                const insertCustomerLst = await SoupService.retrieveDataFromSoup('Account', {}, [], null, [
                    'WHERE {Account:Id} IN ' +
                        '(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN ' +
                        `(SELECT {Account:Id} FROM {Account} WHERE {Account:ParentId} IN (${insertKALst
                            .map((v) => "'" + v.Id + "'")
                            .join(',')})))` +
                        " AND {Account:CUST_LVL__c} = 'Customer Outlet'" +
                        ' ORDER BY {Account:Name} COLLATE NOCASE ASC NULLS LAST'
                ])
                const checkedInsertCustomer = insertCustomerLst.reduce((pre, cur) => {
                    if (selectedCustomer.every((item) => item.Id !== cur.Id)) {
                        pre.push(cur)
                    }
                    return pre
                }, [])
                if (customerLst) {
                    customerLst = customerLst.concat(checkedInsertCustomer)
                } else {
                    customerLst = selectedCustomer.concat(checkedInsertCustomer)
                }
            }
            if (customerLst) {
                setSelectedCustomer(customerLst)
            }
        }
        if (setIsKAChange || (otsSelected !== ots && setIsKAChange)) {
            setIsKAChange(true)
        }
        setSelectedKAs(selectedKA)
        setOtsSelected(ots)
        onBack()
        Instrumentation.reportMetric(`${CommonParam.PERSONA__c} Select a Filter`, 1)
    }

    const checkSelected = (item: any) => {
        return !!selectedKA.find((obj) => item.Id === obj.Id)
    }
    const renderKAItem = (item) => {
        return (
            <View style={styles.KACheckBoxContainer}>
                <CCheckBox
                    onPress={() => {
                        const kaLst = _.cloneDeep(selectedKA)
                        if (!kaLst.find((obj) => obj.Id === item.item.Id)) {
                            kaLst.push(item.item)
                            setSelectedKA(kaLst)
                        } else {
                            setSelectedKA(kaLst.filter((obj) => obj.Id !== item.item.Id))
                        }
                    }}
                    title={
                        <CText numberOfLines={1} style={[styles.smallFontSize, commonStyle.flex_1]}>
                            {item.item.Name}
                        </CText>
                    }
                    checked={checkSelected(item.item)}
                    containerStyle={commonStyle.transparentBG}
                />
            </View>
        )
    }
    return (
        <Modal visible animationType="fade" transparent>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={styles.KATitleContainer}>
                        <View style={[commonStyle.flex_1, commonStyle.alignItemsCenter]}>
                            <CText style={[styles.navTitle]}>{t.labels.PBNA_MOBILE_KA_SELECTOR}</CText>
                        </View>
                    </View>
                    <View style={styles.KASelectorListContainer}>
                        <View style={styles.OTSCustCheckBox}>
                            <CCheckBox
                                onPress={() => {
                                    setOts(!ots)
                                }}
                                title={<CText style={styles.smallFontSize}>{t.labels.PBNA_MOBILE_KA_OTS_CUST}</CText>}
                                checked={ots}
                                containerStyle={commonStyle.transparentBG}
                            />
                        </View>
                        <FlatList
                            style={[commonStyle.marginTop_20, commonStyle.fullWidth]}
                            data={keyAccountLst}
                            extraData={keyAccountLst}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderKAItem}
                            keyExtractor={(item) => item.Id}
                        />
                    </View>
                    {/** Add this wrapper View to fixed style issue, FormBottomButton is a common component */}
                    <View style={styles.formButtonWrapper}>
                        <FormBottomButton
                            rightButtonLabel={t.labels.PBNA_MOBILE_KA_SAVE}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                            onPressCancel={() => {
                                onBack()
                            }}
                            onPressSave={() => {
                                saveSelectedKeyAccount()
                            }}
                            roundedBottom
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}
export default KeyAccountSelector
