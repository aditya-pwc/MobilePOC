/**
 * @description This component is to show distribution day.
 * @author Shangmin Dou
 * @email shangmin.dou@pwc.com
 */
import React, { FC } from 'react'
import { Switch, View, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import _ from 'lodash'
import { t } from '../../../../../common/i18n/t'

const styles = StyleSheet.create({
    distributionPointDayTileContainer: {
        width: '100%',
        marginTop: 20,
        paddingBottom: 5,
        borderBottomColor: '#CDCDCD',
        borderBottomWidth: 1
    },
    innerBox: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    }
})

interface DistributionPointDayTileProps {
    daysOpen: Array<any>
    setDaysOpen: (daysOpen: Array<any>) => void
    weekDay: any
    disabled: boolean
    setIsReadyToAdd: any
}

const DistributionPointDayTile: FC<DistributionPointDayTileProps> = (props: DistributionPointDayTileProps) => {
    const { daysOpen, setDaysOpen, weekDay, disabled, setIsReadyToAdd } = props
    const setSwitch = (v) => {
        const daysOpenNew = _.cloneDeep(daysOpen)
        daysOpenNew[weekDay] = v
        setDaysOpen(daysOpenNew)
    }
    const weekDayMapping = {
        Sunday: t.labels.PBNA_MOBILE_SUNDAY,
        Monday: t.labels.PBNA_MOBILE_MONDAY,
        Tuesday: t.labels.PBNA_MOBILE_TUESDAY,
        Wednesday: t.labels.PBNA_MOBILE_WEDNESDAY,
        Thursday: t.labels.PBNA_MOBILE_THURSDAY,
        Friday: t.labels.PBNA_MOBILE_FRIDAY,
        Saturday: t.labels.PBNA_MOBILE_SATURDAY
    }
    return (
        <View style={styles.distributionPointDayTileContainer}>
            <View style={styles.innerBox}>
                <CText>{weekDayMapping[weekDay]}</CText>
                <Switch
                    value={daysOpen[weekDay]}
                    onValueChange={(v) => {
                        setIsReadyToAdd(false)
                        setSwitch(v)
                    }}
                    disabled={disabled}
                    ios_backgroundColor={'#565656'}
                />
            </View>
        </View>
    )
}

export default DistributionPointDayTile
