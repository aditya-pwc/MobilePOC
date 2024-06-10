/**
 * @description employeeitem workingdaysview view
 * @author Fangfang Ji
 * @email Fangfang.ji@pwc.com
 * @date 2021-07-28
 */
import React from 'react'
import { View } from 'react-native'
import styles from '../../../styles/manager/EmployeeItemStyle'
import CText from '../../../../common/components/CText'
import { formatUTCToLocalTime } from '../../../utils/MerchManagerUtils'

const WorkingDaysView = (props: any) => {
    const { startTime, workingStatus } = props
    return (
        <View style={styles.status}>
            {startTime && (
                <View style={styles.flexDirectionRow}>
                    <CText style={[styles.textTime]}>{formatUTCToLocalTime(startTime)} </CText>
                    <CText style={styles.line}> | </CText>
                </View>
            )}
            <View style={styles.flexDirectionRow}>
                {workingStatus?.map((wStatus) => {
                    return (
                        <CText key={wStatus.name} style={wStatus.attend ? styles.textWorking : styles.textOffDay}>
                            {wStatus.label}
                        </CText>
                    )
                })}
            </View>
        </View>
    )
}

export default WorkingDaysView
