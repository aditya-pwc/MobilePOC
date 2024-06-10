/*
 * @Description: business for SDL My Customer
 * @Author: Yi Li
 * @Date: 2021-12-01 23:09:15
 * @LastEditTime: 2021-12-05 20:05:37
 * @LastEditors: Yi Li
 */
import React, { useState } from 'react'
import { FlatList } from 'react-native'
import { isPersonaUGM } from '../../../../common/enums/Persona'
import RefreshControlM from '../../manager/common/RefreshControlM'
import SDLMyCustomerCell from './SDLMyCustomerCell'
import { assembledDataModelForCell } from './SDLMyCustomerHelper'

interface MyCustomersFlatListProps {
    navigation?: any
    dataSource?: any
    cellRef?: any
    onClickCell?: any
    isEmployeeProfile?: boolean
    pullDownSyncCB?: any
}

const SDLMyCustomerList = (param: MyCustomersFlatListProps) => {
    const { dataSource, cellRef, onClickCell, isEmployeeProfile, pullDownSyncCB } = param
    const [isPullDownSyncing, setIsPullDownSyncing] = useState(false)

    return (
        <FlatList
            style={[{ marginTop: 5 }, isEmployeeProfile && { backgroundColor: '#fff' }]}
            keyExtractor={(item, index) => item + index}
            data={dataSource}
            renderItem={(item) => {
                return (
                    <SDLMyCustomerCell
                        cRef={cellRef}
                        isClickable
                        onPressCell={() => {
                            onClickCell && onClickCell(item)
                        }}
                        itemModal={assembledDataModelForCell(item)}
                        isEmployeeProfile={isEmployeeProfile}
                        showDistance={isPersonaUGM()}
                    />
                )
            }}
            refreshControl={
                pullDownSyncCB && (
                    <RefreshControlM
                        loading={isPullDownSyncing}
                        refreshAction={async () => {
                            setIsPullDownSyncing(true)
                            await pullDownSyncCB()
                            setIsPullDownSyncing(false)
                        }}
                    />
                )
            }
        />
    )
}
export default SDLMyCustomerList
