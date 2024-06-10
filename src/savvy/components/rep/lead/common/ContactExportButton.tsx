/**
 * @description Button to Export Contact.
 * @author Kiren Cao
 * @date 2022-09-30
 */
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native'
import ExportButton from './ExportButton'

const styles = StyleSheet.create({
    overlayStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 0
    },
    addTile: {
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
        shadowColor: '#87939E',
        marginTop: 5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        justifyContent: 'flex-end'
    },
    safeAreaStyle: {
        justifyContent: 'flex-end',
        flexDirection: 'column',
        position: 'absolute',
        right: '5%'
    },
    columnFlexEnd: {
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    rowMarginTop_6: {
        flexDirection: 'row',
        marginTop: 6
    }
})

interface ContactExportButtonProps {
    headerCircleColor: any
    onExportContacts?: any
    overlayStyle?: any
}

const ContactExportButton = (props: ContactExportButtonProps) => {
    const { headerCircleColor, onExportContacts, overlayStyle } = props
    const [showMoreButtons, setShowMoreButtons] = useState(false)
    const renderExport = () => {
        return (
            <View>
                <TouchableOpacity
                    onPress={() => {
                        setShowMoreButtons(false)
                        onExportContacts()
                    }}
                >
                    <ExportButton color={headerCircleColor} />
                </TouchableOpacity>
            </View>
        )
    }
    return (
        <View style={[styles.overlayStyle, overlayStyle]} pointerEvents="box-none">
            {showMoreButtons && (
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.overlayStyle}
                    onPress={() => {
                        setShowMoreButtons(false)
                    }}
                />
            )}

            <SafeAreaView style={styles.safeAreaStyle}>
                <View style={styles.columnFlexEnd}>
                    <View style={styles.rowMarginTop_6}>{onExportContacts && renderExport()}</View>
                </View>
            </SafeAreaView>
        </View>
    )
}

export default ContactExportButton
