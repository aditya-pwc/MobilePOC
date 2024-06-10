import React, { SetStateAction, useState } from 'react'
import { Modal, SafeAreaView, StyleSheet, View, FlatList } from 'react-native'
import _ from 'lodash'
import CText from '../../../../common/components/CText'
import FormBottomButton from '../../../../common/components/FormBottomButton'
import CCheckBox from '../../../../common/components/CCheckBox'
import { t } from '../../../../common/i18n/t'
import { commonStyle } from '../../../../common/styles/CommonStyle'
import { useGetKamWiredGroups } from '../../../hooks/KamCustomerHooks'
import { styles } from '../../rep/customer/innovation-tab/KASelector'
import { baseStyle } from '../../../../common/styles/BaseStyle'

const WiredGroupStyle = StyleSheet.create({
    checkBoxContainer: {
        height: 45,
        justifyContent: 'center',
        marginBottom: 18
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: '5%',
        paddingTop: 30,
        paddingBottom: 20,
        borderBottomColor: '#D3D3D3',
        borderBottomWidth: 1
    },
    selectorListContainer: {
        flex: 1,
        paddingHorizontal: '5%',
        flexWrap: 'wrap'
    },
    customerNumberText: {
        fontSize: 12,
        color: baseStyle.color.titleGray,
        marginLeft: 40
    }
})

export interface WiredGroupItem {
    GroupName: string
    CustomerNumber: number
}

interface KamWiredGroupSelectorProps {
    onBack: Function
    wiredGroupsData: WiredGroupItem[]
    setWiredGroupsData: React.Dispatch<SetStateAction<WiredGroupItem[]>>
    isShowSelector: boolean
}

const KamWiredGroupSelector = (props: KamWiredGroupSelectorProps) => {
    const { onBack, wiredGroupsData, setWiredGroupsData, isShowSelector } = props
    const wiredGroupsList = useGetKamWiredGroups(isShowSelector)
    const [selectedWiredGroups, setSelectedWiredGroups] = useState(wiredGroupsData)

    const saveSelectedWiredGroup = () => {
        setWiredGroupsData(selectedWiredGroups)
        onBack()
    }

    const checkSelected = (item: WiredGroupItem) => {
        return !!selectedWiredGroups.find((obj) => item.GroupName === obj.GroupName)
    }

    const renderListItem = (item: WiredGroupItem | any) => {
        const numText =
            item.item.CustomerNumber > 1 ? t.labels.PBNA_MOBILE_ORDERING_MY_CUSTOMERS : t.labels.PBNA_MOBILE_CUSTOMER
        return (
            <View style={WiredGroupStyle.checkBoxContainer}>
                <CCheckBox
                    onPress={() => {
                        const prevList = _.cloneDeep(selectedWiredGroups)
                        if (!prevList.find((obj) => obj.GroupName === item.item.GroupName)) {
                            prevList.push(item.item)
                            setSelectedWiredGroups(prevList)
                        } else {
                            setSelectedWiredGroups(prevList.filter((obj) => obj.GroupName !== item.item.GroupName))
                        }
                    }}
                    title={
                        <CText numberOfLines={1} style={[styles.smallFontSize, commonStyle.flex_1]}>
                            {item.item.GroupName}
                        </CText>
                    }
                    checked={checkSelected(item.item)}
                    containerStyle={commonStyle.transparentBG}
                />
                <CText numberOfLines={1} style={WiredGroupStyle.customerNumberText}>
                    {`${item.item.CustomerNumber} ${numText}`}
                </CText>
            </View>
        )
    }
    return (
        <Modal visible animationType="fade" transparent>
            <SafeAreaView style={styles.container}>
                <View style={styles.eHeader}>
                    <View style={WiredGroupStyle.titleContainer}>
                        <View style={[commonStyle.flex_1, commonStyle.alignItemsCenter]}>
                            <CText style={[styles.navTitle]}>
                                {t.labels.PBNA_MOBILE_WIRED_COMMUNICATION_GROUP.toLocaleUpperCase()}
                            </CText>
                        </View>
                    </View>
                    <View style={WiredGroupStyle.selectorListContainer}>
                        <FlatList
                            style={[commonStyle.marginTop_20, commonStyle.fullWidth]}
                            data={wiredGroupsList}
                            extraData={wiredGroupsList}
                            showsVerticalScrollIndicator={false}
                            renderItem={renderListItem}
                            keyExtractor={(item) => item.GroupName}
                        />
                    </View>
                    {/** Add this wrapper to fixed style issue, FormBottomButton is a common component */}
                    <View style={styles.formButtonWrapper}>
                        <FormBottomButton
                            rightButtonLabel={t.labels.PBNA_MOBILE_KA_SAVE}
                            leftButtonLabel={t.labels.PBNA_MOBILE_CANCEL}
                            onPressCancel={() => {
                                onBack()
                            }}
                            onPressSave={() => {
                                saveSelectedWiredGroup()
                            }}
                            roundedBottom
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default KamWiredGroupSelector
