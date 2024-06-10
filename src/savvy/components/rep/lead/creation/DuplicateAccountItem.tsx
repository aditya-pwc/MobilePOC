/**
 * @description Component to show Duplicate Lead Item.
 * @author Qiulin Deng
 * @date 2021-05-10
 */
/* eslint-disable camelcase */
import React from 'react'
import { TouchableOpacity, View, Image, StyleSheet } from 'react-native'
import CText from '../../../../../common/components/CText'
import { ImageSrc } from '../../../../../common/enums/ImageSrc'
import { t } from '../../../../../common/i18n/t'

interface AllAccountProps {
    account: {
        Is_Active: boolean
        LastName: string
        Street: string
        City: string
        PostalCode: string
        State: string
        Phone: number
    }
    navigation: any
}

const styles = StyleSheet.create({
    activeContainer: {
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        marginBottom: 12,
        borderRadius: 5,
        shadowColor: '#DCE5EE',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1,
        shadowRadius: 4,
        flexDirection: 'column'
    },
    Container: {
        backgroundColor: '#F4F6F9',
        marginTop: 10,
        marginBottom: 12,
        borderRadius: 5,
        shadowColor: '#004C97',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        flexDirection: 'column'
    },
    inactiveFieldContainer: {
        height: 22,
        position: 'absolute',
        top: 0,
        left: 0
    },
    inactiveContainer: {
        height: 20,
        width: 82,
        backgroundColor: '#000000',
        borderTopLeftRadius: 6,
        borderBottomRightRadius: 20,
        justifyContent: 'center'
    },
    inactiveText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 7
    },
    addressContainer: {
        height: 108,
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 19.38,
        justifyContent: 'space-between'
    },
    addressInnerContainer: {
        width: '75%',
        paddingLeft: '1%',
        paddingTop: 22
    },
    companyText: {
        fontSize: 18,
        fontWeight: '700',
        overflow: 'hidden'
    },
    streetText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656',
        marginTop: 8,
        marginBottom: 3
    },
    cityText: {
        fontSize: 12,
        fontWeight: '400',
        color: '#565656'
    },
    addButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    addButton: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#00A2D9'
    },
    bottomBarContainer: {
        height: 39,
        backgroundColor: '#F0F3F6',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1,
        borderColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 19
    },
    lastModifiedTaskText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: '#706E6B',
        marginRight: 4
    },
    lastModifiedTaskDateText: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
        color: 'black'
    },
    tierText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: '#565656'
    },
    callCounterContainer: {
        borderColor: '#D3D3D3',
        borderRadius: 5,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 2,
        backgroundColor: 'white'
    },
    callCounterText: {
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 16,
        color: 'black',
        marginLeft: 2
    },
    addedContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    checkmate: {
        width: 18,
        height: 18
    },
    addedText: {
        fontWeight: '700',
        fontSize: 12,
        lineHeight: 16
    },
    whiteBoxContainer: {
        height: 115,
        flexDirection: 'row'
    },
    whiteBoxInfoContainer: {
        width: '65%',
        flexDirection: 'column'
    },
    iconInfoContainer: {
        width: '25%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonOuterContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    callCounterIcon: {
        height: 12,
        width: 12,
        margin: 1,
        marginTop: 2
    },
    locationButton: {
        height: 21,
        width: 18
    },
    callButton: {
        height: 18.72,
        width: 18,
        marginBottom: 20
    },
    accountIconContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    rowLayout: {
        flexDirection: 'row'
    },
    logoIcon: {
        height: 58,
        width: 58
    }
})

const DuplicateAccountItem = (props: AllAccountProps) => {
    const { account } = props

    const renderInActive = () => {
        if (!account.Is_Active) {
            return (
                <View style={styles.inactiveFieldContainer}>
                    <View style={styles.inactiveContainer}>
                        <CText style={styles.inactiveText}>{t.labels.PBNA_MOBILE_INACTIVE}</CText>
                    </View>
                </View>
            )
        }
        return null
    }
    const renderPhone = () => {
        if (account.Phone) {
            return (
                <TouchableOpacity>
                    <Image source={ImageSrc.ICON_CALL} style={styles.callButton} />
                </TouchableOpacity>
            )
        }
        return null
    }
    const renderContext = () => (
        <View style={styles.whiteBoxContainer}>
            <View style={styles.iconInfoContainer}>
                {renderInActive()}
                <View style={[styles.accountIconContainer]}>
                    <Image source={ImageSrc.DUP_ACCOUNT_LOG} style={styles.logoIcon} />
                </View>
            </View>
            <View style={styles.whiteBoxInfoContainer}>
                <View style={styles.rowLayout}>
                    <View style={styles.addressInnerContainer}>
                        <CText numberOfLines={2} style={styles.companyText}>
                            {account.LastName}
                        </CText>
                        <CText numberOfLines={1} style={styles.streetText}>
                            {account.Street}
                        </CText>
                        <CText style={styles.cityText}>
                            {account.City ? account.City + ', ' : null}
                            {account.State}
                            {account.PostalCode ? ' ' + account.PostalCode : null}
                        </CText>
                    </View>
                </View>
            </View>
            <View style={styles.buttonOuterContainer}>
                {renderPhone()}
                <TouchableOpacity>
                    {/* <Image source={ImageSrc.ICON_LOCATION} style={styles.locationButton} /> */}
                </TouchableOpacity>
            </View>
        </View>
    )

    const renderContainer = () => {
        if (account.Is_Active) {
            return <TouchableOpacity style={[styles.activeContainer]}>{renderContext()}</TouchableOpacity>
        }
        return <TouchableOpacity style={[styles.Container]}>{renderContext()}</TouchableOpacity>
    }
    return renderContainer()
}

export default DuplicateAccountItem
