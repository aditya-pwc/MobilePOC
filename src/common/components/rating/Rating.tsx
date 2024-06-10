/**
 * @description A custom component to show rating since there are some issues with the
 * react native elements rating.
 * @author Shangmin Dou
 * @date 2021-05-10
 */
import React, { FC, memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { commonStyle } from '../../styles/CommonStyle'
import CText from '../CText'
import _ from 'lodash'

interface RatingProps {
    value: number
}

const styles = StyleSheet.create({
    container: {
        height: 30,
        width: 100
    },
    topStar: {
        color: 'gray',
        fontSize: 20
    },
    bottomStar: {
        fontSize: 20,
        color: '#FFBE03'
    },
    bottomStarContainer: {
        position: 'absolute',
        flexDirection: 'row',
        height: 30,
        overflow: 'hidden'
    }
})

const MIN_VALUE = 0
const MAX_VALUE = 5

const isValid = (value: number) => {
    return _.isNumber(value) && !_.isNaN(value) && value >= MIN_VALUE && value <= MAX_VALUE
}

const Rating: FC<RatingProps> = memo((props: RatingProps) => {
    const { value } = props
    const displayValue = isValid(value) ? value : 0
    return (
        <View style={styles.container}>
            <View style={commonStyle.flexDirectionRow}>
                <CText style={styles.topStar}>★★★★★</CText>
            </View>
            {/* the max value is 100, so the step is 20 */}
            <View style={[styles.bottomStarContainer, { width: displayValue * 20 }]}>
                <CText style={styles.bottomStar}>★★★★★</CText>
            </View>
        </View>
    )
})

Rating.defaultProps = {
    value: 0
}
Rating.displayName = 'Rating'

export default Rating
