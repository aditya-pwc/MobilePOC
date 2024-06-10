/*
 * @Author: Yuan Yue
 * @Date: 2021-09-07 16:30:15
 * @LastEditTime: 2021-10-28 13:49:25
 * @LastEditors:Yuan Yue
 * @Description: In User Settings Edit
 * @FilePath: /Halo_Mobile/src/components/manager/schedule/PortraitView.tsx
 */
import React, { FC, useEffect } from 'react'
import { RootStackNavigation } from '../../../app'

interface IProps {
    children: React.ReactChild | React.ReactChildren | React.ReactElement<any>[]
    navigation: RootStackNavigation
    setMapModalVisible: any
    setCurrentCardId: any
    setEmployeeList: any
    employeeList: any
    setIsELoading: any
    handelSelectedDay: any
}

const PortraitView: FC<IProps> = (props: IProps) => {
    const { children, setMapModalVisible, handelSelectedDay } = props
    useEffect(() => {
        handelSelectedDay()
        return () => {
            setMapModalVisible(false)
        }
    }, [])
    return <>{children}</>
}

export default PortraitView
