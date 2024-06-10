/*
 * @Author: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @Date: 2023-02-27 14:18:50
 * @LastEditors: jianminshen Jianmin.Shen.Contractor@pepsico.com
 * @LastEditTime: 2023-03-31 11:22:23
 */
import React from 'react'
import { StyleSheet, Dimensions, View, TouchableOpacity, Image } from 'react-native'
import Pdf from 'react-native-pdf'
const RNFS = require('react-native-fs')

const styles = StyleSheet.create({
    backImg: {
        width: 14,
        height: 24,
        marginLeft: 20,
        marginBottom: 15
    },

    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 25
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 56,
        backgroundColor: 'white'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        width: Dimensions.get('window').width,
        height: 56
    }
})
interface PremierTaskProps {
    navigation: any
    route: any
}
const PremierTaskScreen = (props: PremierTaskProps) => {
    const { navigation, route } = props
    const absolutePath = RNFS.DocumentDirectoryPath + '/rules.pdf'
    const fullpath = `file:///${absolutePath}`
    const source = { uri: fullpath }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('VisitDetail', { item: route?.params?.visit })}>
                    <Image style={styles.backImg} source={require('../../../assets/image/ios-chevron-left.png')} />
                </TouchableOpacity>
            </View>
            <Pdf source={source} style={styles.pdf} />
        </View>
    )
}

export default PremierTaskScreen
