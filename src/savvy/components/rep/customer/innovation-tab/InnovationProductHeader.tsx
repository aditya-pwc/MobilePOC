import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import StorePlaceholderSvg from '../../../../../../assets/image/Icon-store-placeholder-small.svg'
import React from 'react'
import CText from '../../../../../common/components/CText'
import { commonStyle } from '../../../../../common/styles/CommonStyle'

interface InnovationProductHeaderProps {
    navigation: any
    retailStore: any
    onLeavingPage?: Function
}
const styles = StyleSheet.create({
    bgtContainer: {
        width: '100%',
        paddingHorizontal: 22
    },
    iconStore: {
        height: 36,
        width: 36,
        marginRight: 20
    },
    headerContainer: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#D3D3D3'
    },
    headerIconAndText: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '75%'
    },
    headerTextStyle: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'capitalize'
    },
    goBackIcon: {
        height: 36,
        width: 36
    }
})

const InnovationProductHeader = (props: InnovationProductHeaderProps) => {
    const { retailStore, navigation, onLeavingPage } = props

    return (
        <View style={styles.bgtContainer}>
            <View style={styles.headerContainer}>
                <View style={styles.headerIconAndText}>
                    {retailStore['Account.IsOTSCustomer__c'] === '0' && (
                        <StorePlaceholderSvg style={styles.iconStore} />
                    )}
                    {retailStore['Account.IsOTSCustomer__c'] === '1' && (
                        <Image
                            style={styles.iconStore}
                            source={require('../../../../../../assets/image/OTS-Logo-Not-Signed.png')}
                        />
                    )}
                    <CText style={styles.headerTextStyle} numberOfLines={1}>
                        {retailStore.Name}
                    </CText>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        onLeavingPage && onLeavingPage()
                        navigation.goBack()
                    }}
                    style={commonStyle.flexRowJustifyEnd}
                >
                    <Image
                        source={require('../../../../../../assets/image/ios-close-circle-outline.png')}
                        style={styles.goBackIcon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default InnovationProductHeader
