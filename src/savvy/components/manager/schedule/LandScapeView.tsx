/*
 * @Author: your name
 * @Date: 2021-09-07 16:30:15
 * @LastEditTime: 2021-09-27 16:23:02
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/manager/schedule/LandScapeView.tsx
 */
import React, { FC, useEffect } from 'react'
import { View } from 'react-native'
import NewScheduleListStyle from '../../../styles/manager/NewScheduleListStyle'

const styles = NewScheduleListStyle

interface IProps {
    children: React.ReactChild | React.ReactChildren | React.ReactElement<any>[]
    navigation?: any
    setMapModalVisible: any
    setCurrentCardId: any
    setEmployeeList: any
    employeeList: any
    setIsELoading: any
}

const LandScapeView: FC<IProps> = (props: IProps) => {
    const { navigation, children, setMapModalVisible, setCurrentCardId, setEmployeeList, employeeList, setIsELoading } =
        props
    useEffect(() => {
        navigation.setOptions({ tabBarVisible: false })
        employeeList.forEach((element) => {
            element.landScapeEItemSelected = false
        })
        setEmployeeList(employeeList)
        setCurrentCardId(null)
        setIsELoading(false)

        return () => {
            navigation.setOptions({ tabBarVisible: false })
            setIsELoading(false)
            setCurrentCardId(null)
            setMapModalVisible(false)
        }
    }, [])

    return <View style={styles.landScapeView}>{children}</View>
}

export default LandScapeView
