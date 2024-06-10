import React, { useEffect } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'

import 'moment-timezone'
import CText from '../../../common/components/CText'

import { Button } from 'react-native-elements'
import { t } from '../../../common/i18n/t'
import _ from 'lodash'
const { width } = Dimensions.get('window')

interface SignatureBtnProps {
    goback: any
    checkOutHandler: any
    isDisabled: any
}

const styles = StyleSheet.create({
    disabled: {
        fontFamily: 'Gotham-Bold',
        color: '#rgb(211, 211, 211)',
        textTransform: 'uppercase',
        fontSize: 12,
        backgroundColor: '#FFF'
    },
    containerStyle: {
        height: 59,
        width: '100%',
        borderColor: '#FFF',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignContent: 'center',
        bottom: 0,
        position: 'absolute'
    },
    shadow: {
        backgroundColor: '#FFF',
        color: '#6217B9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        elevation: 1,
        borderColor: 'rgba(0, 0, 0, 0.14)',
        borderWidth: 1,
        alignItems: 'center',
        borderRadius: 0
    },
    outOfLocation: {
        backgroundColor: '#FFF',
        color: '#6217B9'
    },
    buttonStyle: {
        height: '100%',
        width: width / 2,
        paddingBottom: 25,
        fontSize: 12,
        borderRadius: 0
    },
    titleStyle: {
        fontFamily: 'Gotham-Bold',
        color: '#FFF',
        textTransform: 'uppercase',
        textAlign: 'center',
        fontSize: 12,
        width: '100%'
    },

    insideLocation: {
        backgroundColor: '#6217B9'
    }
})

const SignaturePad = (parentProps: SignatureBtnProps) => {
    const { goback, checkOutHandler, isDisabled } = parentProps
    useEffect(() => {}, [isDisabled])

    const onPressCheckOut = _.throttle(checkOutHandler, 500)
    return (
        <View style={[styles.containerStyle]}>
            <Button
                onPress={goback}
                title={
                    <CText style={[styles.titleStyle, styles.outOfLocation]}>
                        {t.labels.PBNA_MOBILE_GO_BACK.toUpperCase()}
                    </CText>
                }
                buttonStyle={[styles.buttonStyle, styles.outOfLocation]}
                containerStyle={[styles.shadow]}
                titleStyle={[styles.titleStyle, styles.outOfLocation]}
            />
            <Button
                onPress={onPressCheckOut}
                disabled={isDisabled}
                disabledStyle={styles.disabled}
                title={
                    <CText style={[styles.titleStyle, styles.insideLocation, isDisabled && styles.disabled]}>
                        {t.labels.PBNA_MOBILE_DONE.toUpperCase()}
                    </CText>
                }
                buttonStyle={[styles.buttonStyle, styles.insideLocation, isDisabled && styles.disabled]}
                containerStyle={[styles.shadow, styles.insideLocation, isDisabled && styles.disabled]}
                titleStyle={[styles.titleStyle, styles.insideLocation, isDisabled && styles.disabled]}
            />
        </View>
    )
}

export default SignaturePad
