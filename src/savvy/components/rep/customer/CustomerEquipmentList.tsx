/**
 * @description Customer Equipment List Component
 * @author Pawn
 * @date 2021-10-29
 */
import React, { FC } from 'react'
import { Dimensions, FlatList, StyleSheet, View } from 'react-native'
import CustomerEquipmentListTile from './CustomerEquipmentListTile'

interface CustomerEquipmentListProps {
    cRef?: any
    navigation: any
    accountId: string
    equipmentList: any
    isLoading: boolean
    setAssetDetail: any
    setCurrentAsset: any
    setSelected
    activeServiceTypes
    pepsiColaNationalAccount
    equipmentTypeCodeDesc: any
    selectAllEquipments: boolean
}

const screenHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: screenHeight / 2.2
    },
    listContainer: {
        width: '100%',
        paddingTop: 20,
        backgroundColor: 'white'
    },
    noListContainer: {
        width: '100%',
        backgroundColor: 'white'
    },
    lineStyle: {
        marginBottom: 20,
        marginRight: 22,
        marginLeft: 22,
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    paddingContainer: {
        marginBottom: 20,
        marginRight: 22,
        marginLeft: 22
    }
})

const CustomerEquipmentList: FC<CustomerEquipmentListProps> = (props: CustomerEquipmentListProps) => {
    const { setSelected, activeServiceTypes, pepsiColaNationalAccount, equipmentTypeCodeDesc, selectAllEquipments } =
        props
    const renderItem = (item, index, lastIndex) => (
        <View style={index === lastIndex - 1 ? styles.paddingContainer : styles.lineStyle} key={item.Id}>
            <CustomerEquipmentListTile
                equipment={item}
                setAssetDetail={props.setAssetDetail}
                equipmentTypeCodeDesc={equipmentTypeCodeDesc}
                navigation={props.navigation}
                setCurrentAsset={props.setCurrentAsset}
                setSelected={setSelected}
                activeServiceTypes={activeServiceTypes}
                pepsiColaNationalAccount={pepsiColaNationalAccount}
                selectAllEquipments={selectAllEquipments}
            />
        </View>
    )
    return (
        <View style={styles.container}>
            <View style={props.equipmentList.length > 0 ? styles.listContainer : styles.noListContainer}>
                <FlatList
                    data={props.equipmentList}
                    renderItem={({ item, index }) => renderItem(item, index, props.equipmentList.length)}
                />
            </View>
        </View>
    )
}

export default CustomerEquipmentList
